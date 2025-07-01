"use client"

import { Inter } from "next/font/google";
import { Amplify } from "aws-amplify";
import  "./app.css";

import {Authenticator} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css"

import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

const inter = Inter({ subsets: ["latin"] });

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Authenticator>{children}</Authenticator>
      </body>
    </html>
  );
}
