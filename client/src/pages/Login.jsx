import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const [
    registerUser,
    {
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();
  const [
    loginUser,
    { error: loginError, isLoading: loginIsLoading, isSuccess: loginIsSuccess },
  ] = useLoginUserMutation();

  useEffect(() => {
    if (loginIsSuccess || registerIsSuccess) {
      navigate("/");
    }
  }, [loginIsSuccess, registerIsSuccess, navigate]);

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    type === "signup"
      ? setSignupInput((prev) => ({ ...prev, [name]: value }))
      : setLoginInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (type) => {
    const action = type === "signup" ? registerUser : loginUser;
    const inputData = type === "signup" ? signupInput : loginInput;
    await action(inputData);
  };

  return (
    <div className="flex items-center w-full justify-center mt-20 py-8">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>

        {/* Signup Form */}
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>
                Create a new account by filling in the details below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={signupInput.name}
                onChange={(e) => changeInputHandler(e, "signup")}
                type="text"
                placeholder="Enter your full name"
              />

              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={signupInput.email}
                onChange={(e) => changeInputHandler(e, "signup")}
                type="email"
                placeholder="Enter your email"
              />

              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                value={signupInput.password}
                onChange={(e) => changeInputHandler(e, "signup")}
                type="password"
                placeholder="Enter your password"
              />

              {registerError && (
                <p className="text-red-500 text-sm">
                  Signup failed. Try again.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                disabled={registerIsLoading}
                onClick={() => handleSubmit("signup")}
              >
                {registerIsLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Login Form */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                name="email"
                value={loginInput.email}
                onChange={(e) => changeInputHandler(e, "login")}
                type="email"
                placeholder="Enter your email"
              />

              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                name="password"
                value={loginInput.password}
                onChange={(e) => changeInputHandler(e, "login")}
                type="password"
                placeholder="Enter your password"
              />

              {loginError && (
                <p className="text-red-500 text-sm">Login failed. Try again.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                disabled={loginIsLoading}
                onClick={() => handleSubmit("login")}
              >
                {loginIsLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;
