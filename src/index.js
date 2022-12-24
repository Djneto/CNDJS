/*
Essa será uma aplicação para gerenciar tarefas (em inglês *todos*). Será permitida a criação de um usuário com `name` e `username`, bem como fazer o CRUD de *todos*:

- Criar um novo *todo*;
- Listar todos os *todos*;
- Alterar o `title` e `deadline` de um *todo* existente;
- Marcar um *todo* como feito;
- Excluir um *todo*;

Tudo isso para cada usuário em específico (o `username` será passado pelo header). 
*/

const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(404).json({ error: "User not found!"})
  } else {
    request.user = user;
    return next();
  }
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists){
    return response.status(400).json({ error: "User already exists!"}) 
  } else {

    const newUser = {
      id: uuidv4(),
      name: name,
      username: username,
      todos: []
    }
  
    users.push(newUser);
  
    return response.status(201).json(newUser);
  };
  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(newTodo);
  return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => {return todo.id === id});

  if(todo){
    user.todos.map((todo) => {
      if(todo.id === id){
        todo.title = title,
        todo.deadline = deadline
        return todo;
      }
    });
    return response.status(201).json(todo);
  } else {
    return response.status(404).json({ error: "Todo not found!"})
  }

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => {return todo.id === id});

  if(todo){
    user.todos.map((todo) => {
      if(todo.id === id){
        todo.done = true;
      }
    });
    return response.status(201).json(todo);
  } else {
    return response.status(404).json({ error: "Todo not found!"})
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => {return todo.id === id});

  if(todo){
    user.todos.splice(user.todos.indexOf(todo), 1);
    return response.status(204).send();
  } else {
    return response.status(404).json({ error: "Todo not found!"})
  }
});

module.exports = app;