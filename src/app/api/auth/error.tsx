// pages/auth/error.tsx
import { useRouter } from "next/router";
import Link from "next/link";
import { NextPage } from "next";

const AuthError: NextPage = () => {
  const router = useRouter();
  const { message } = router.query;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Authentication Error
        </h1>
        <p className="mb-6 text-gray-700">
          {typeof message === "string"
            ? message
            : "An error occurred during authentication"}
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default AuthError;
