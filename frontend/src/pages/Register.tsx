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
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";

type FormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [data, setData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    if (!data.fullName.trim()) errors.fullName = "Full name is required.";
    if (!data.email.trim()) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(data.email))
      errors.email = "Email is invalid.";
    if (!data.password) errors.password = "Password is required.";
    else if (data.password.length < 8)
      errors.password = "Password must be at least 8 characters.";
    if (data.password !== data.confirmPassword)
      errors.confirmPassword = "Passwords do not match.";
    return errors;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();

    const e = validateForm();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      setSubmitting(true);
      await register(data.fullName, data.email, data.password);
      navigate("/login", { replace: true });
    } catch (err: any) {
      setErrors({ email: err.message || "Registration failed" });
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

      {/* Right: form */}
      <div className="overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="flex min-h-full flex-col items-center justify-center p-6"
        >
          <h1 className="mb-2 text-3xl font-bold">Register</h1>
          <p className="mb-2 text-gray-600">Organize your invoices</p>

          {/* Full Name */}
          <Field className="max-w-sm m-2">
            <FieldLabel htmlFor="full-name-input">Full Name</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="full-name-input"
                type="text"
                placeholder="Enter your full name"
                value={data.fullName}
                onChange={(e) => setData({ ...data, fullName: e.target.value })}
              />
            </InputGroup>
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </Field>

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

          {/* Confirm Password */}
          <Field className="m-2 mb-6 max-w-sm">
            <FieldLabel htmlFor="password-confirm-input">
              Password Confirm
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="password-confirm-input"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={data.confirmPassword}
                onChange={(e) =>
                  setData({ ...data, confirmPassword: e.target.value })
                }
              />
              <InputGroupAddon
                align="inline-end"
                className="cursor-pointer"
                onClick={() => setShowConfirmPassword((s) => !s)}
              >
                {showConfirmPassword ? <Eye /> : <EyeOffIcon />}
              </InputGroupAddon>
            </InputGroup>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </Field>

          <Button
            type="submit"
            disabled={submitting}
            className="w-2xs p-5"
            variant="default"
          >
            {submitting ? "Creating account..." : "Create account"}
          </Button>

          <p className="mt-4 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-black hover:underline"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
