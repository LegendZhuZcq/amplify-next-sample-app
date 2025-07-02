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

const client = generateClient<Schema>({
  authMode:'userPool',
});

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
    
  const {user, signOut } = useAuthenticator();

  function deleteTodo(id: string){
    client.models.Todo.delete({id}).then(() => {
      console.log("Todo deleted:", id);
      // Explicitly refresh the list after deletion
      refreshTodos();
    }).catch((error) => {
      console.error("Error deleting todo:", error);
    });
  }

  // Function to explicitly refresh todos
  function refreshTodos() {
    if (!user) return;
    console.log("Refreshing todos...");
    client.models.Todo.list({
      filter: {
        user: {
          eq: user.signInDetails?.loginId
        }
      }
    }).then((result) => {
      console.log("Todos refreshed:", result.data);
      setTodos([...result.data]);
    }).catch((error) => {
      console.error("Error refreshing todos:", error);
    });
  }

  useEffect(() => {
    if (!user) return;
    console.log("Setting up subscription for user:", user.signInDetails?.loginId);
    
    // Set up real-time subscription
    const sub = client.models.Todo.observeQuery({
      filter: {
        user: {
          eq: user.signInDetails?.loginId
        }
      }
    }).subscribe({
      next: ({ items, isSynced }) => {
        console.log("Subscription update received:", { items, isSynced });
        setTodos([...items]);
        
        // Initial load might not be synced, so refresh once synced
        if (isSynced && items.length === 0) {
          console.log("Synced but no items, refreshing...");
          refreshTodos();
        }
      },
      error: (error) => {
        console.error("Subscription error:", error);
      }
    });
    
    // Initial fetch to ensure we have data
    refreshTodos();
    
    // Return cleanup function to unsubscribe when component unmounts or user changes
    return () => {
      console.log("Cleaning up subscription");
      sub.unsubscribe();
    };
  }, [user]);

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({
        content: content,
        user: user.signInDetails?.loginId,
        isDone: false,
      }).then((result) => {
        console.log("Todo created:", result);
        console.log("Created by user:", user?.signInDetails?.loginId);
        // Explicitly refresh the list after creation
        refreshTodos();
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
