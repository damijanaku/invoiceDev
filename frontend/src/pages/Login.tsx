import { Mail, Eye, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import devImg from "../assets/dev.jpeg";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useNavigate } from "react-router";

type FormData = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

function Login() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  let navigate = useNavigate();

  const [data, setData] = useState<FormData>({
    email: "",
    password: "",
  });

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    if (!data.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email is invalid.";
    }
    if (!data.password) {
      errors.password = "Password is required.";
    }

    return errors;
  };

  const handleSubmit = async (ev: React.SubmitEvent) => {
    ev.preventDefault();
    setSuccess(false);

    const e = validateForm();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      setSubmitting(true);

      const response = await fetch("http://localhost:3000/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (body.errors) {
          setErrors(body.errors);
        } else {
          setErrors({ email: body.message || "Something went wrong" });
        }
        return;
      }

      setSuccess(true);
      setData({ email: "", password: "" });
      navigate("/login");
    } catch (err) {
      console.error(err);
      setErrors({ email: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-dvh grid-cols-[35fr_65fr] overflow-hidden">
      {/* Left: image */}
      <div className="relative">
        <img
          src={devImg}
          className="absolute inset-0 h-full w-full object-cover"
          alt="fallback"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-white">
          <p className="text-3xl font-bold">Organize your business</p>
        </div>
      </div>

      {/* Right: form area */}
      <div className="overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="flex min-h-full flex-col items-center justify-center p-6"
        >
          <h1 className="mb-2 text-3xl font-bold">Login</h1>
          <p className="mb-2 text-gray-600">Organize your invoices</p>

          {/* Email */}
          <Field className="max-w-sm m-2">
            <FieldLabel htmlFor="email-input">Email</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="email-input"
                type="email"
                placeholder="Enter email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
              <InputGroupAddon align="inline-end">
                <Mail />
              </InputGroupAddon>
            </InputGroup>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </Field>

          {/* Password */}
          <Field className="m-2 max-w-sm">
            <FieldLabel htmlFor="password-input">Password</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="password-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
              <InputGroupAddon
                align="inline-end"
                className="cursor-pointer"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? <Eye /> : <EyeOffIcon />}
              </InputGroupAddon>
            </InputGroup>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </Field>

          <Button
            type="submit"
            disabled={submitting}
            className="w-2xs p-5"
            variant="default"
          >
            {submitting ? "Loggining in..." : "Login"}
          </Button>
          <p className="mt-4 text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-medium text-black hover:underline"
            >
              Sign Up
            </a>
          </p>
        </form>
        {success && (
          <p className="text-sm text-green-600">Logged in successfully!</p>
        )}
      </div>
    </div>
  );
}

export default Login;
