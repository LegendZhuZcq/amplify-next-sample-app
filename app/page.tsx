"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";

import { useAuthenticator } from "@aws-amplify/ui-react";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
    
  const {user, signOut } = useAuthenticator();

function listTodos() {
  // Use observeQuery without manual filtering - let Amplify's allow.owner() handle it
  // The allow.owner() rule should automatically filter to only show current user's todos
  client.models.Todo.observeQuery().subscribe({
    next: (data) => {
      console.log("User:", user?.signInDetails?.loginId);
      console.log("Todos received:", data.items);
      data.items.forEach(todo => {
        console.log("Todo content:", todo.content, "User:", todo.user);
      });
      setTodos([...data.items]);
    },
    error: (error) => {
      console.error("Error fetching todos:", error);
    }
  });
}

  function deleteTodo(id: string){
    client.models.Todo.delete({id}).then(() => {
      console.log("Todo deleted:", id);
    }).catch((error) => {
      console.error("Error deleting todo:", error);
    });
  }

  useEffect(() => {
    if (user) {
      listTodos();
    }
  }, [user]);

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({
        content: content,
        user: user.signInDetails?.loginId,
      }).then((result) => {
        console.log("Todo created:", result);
        console.log("Created by user:", user?.signInDetails?.loginId);
      }).catch((error) => {
        console.error("Error creating todo:", error);
      });
    }
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li
          onClick ={()=>deleteTodo(todo.id)} 
          key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/">
          Review next steps of this tutorial.
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}
