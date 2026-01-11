"use client";
import { useRouter } from "next/navigation";
import Register from "../components/Register";

export default function RegisterPage() {
  const router = useRouter();
  return <Register onSuccess={() => router.push("/weekboard")} />;
}
