import { Mail, Loader2, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { NavigationMenuDemo } from "@/components/ui/navbar";
import { useParams } from "react-router-dom";

type BusinessForm = {
  name: string;
  description: string;
  address: string;
  taxId: string;
  registrationNumber: string;
  phoneNumber: string;
  email: string;
  trr: string;
};

const initialForm: BusinessForm = {
  name: "",
  description: "",
  address: "",
  taxId: "",
  registrationNumber: "",
  phoneNumber: "",
  email: "",
  trr: "",
};

const EditBusiness = () => {
  const { id } = useParams<{ id: string }>();
  const { authFetch } = useAuth();
  const [form, setForm] = useState<BusinessForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await authFetch(
          `http://localhost:3000/api/v1/businesses/${id}`
        );
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || "Failed to load business");
        }
        const { business } = await res.json();
        setForm({
          name: business.name ?? "",
          description: business.description ?? "",
          address: business.address ?? "",
          taxId: business.taxId ?? "",
          registrationNumber: business.registrationNumber ?? "",
          phoneNumber: business.phoneNumber ?? "",
          email: business.email ?? "",
          trr: business.trr ?? "",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load business"
        );
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  const handleChange =
    (key: keyof BusinessForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await authFetch(
        `http://localhost:3000/api/v1/businesses/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to update business");
      }

      setSuccess("Business updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-center m-4">
        <NavigationMenuDemo />
      </div>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Building2 className="h-5 w-5 text-gray-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Edit your company
            </h1>
          </div>
          <p className="text-sm text-gray-500 mb-8 ml-12">
            This info will appear on every invoice you send.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field className="w-full">
              <FieldLabel
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Company name
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange("name")}
                  required
                />
              </InputGroup>
            </Field>

            <Field className="w-full">
              <FieldLabel
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Description
                <span className="ml-1 text-gray-400 font-normal">
                  (optional)
                </span>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange("description")}
                />
              </InputGroup>
            </Field>

            <Field className="w-full">
              <FieldLabel
                htmlFor="address"
                className="text-sm font-medium text-gray-700"
              >
                Address
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange("address")}
                  required
                />
              </InputGroup>
            </Field>

            {/* Divider */}
            <div className="border-t border-gray-100 pt-1" />

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel
                  htmlFor="taxId"
                  className="text-sm font-medium text-gray-700"
                >
                  Tax ID
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="taxId"
                    name="taxId"
                    value={form.taxId}
                    onChange={handleChange("taxId")}
                    required
                  />
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="registrationNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Registration number
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="registrationNumber"
                    name="registrationNumber"
                    value={form.registrationNumber}
                    onChange={handleChange("registrationNumber")}
                    required
                  />
                </InputGroup>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone number
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                    required
                  />
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    autoComplete="email"
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </div>

            <Field className="w-full">
              <FieldLabel htmlFor="trr">Bank account (TRR)</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="trr"
                  name="trr"
                  value={form.trr}
                  onChange={handleChange("trr")}
                  required
                />
              </InputGroup>
            </Field>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-700" role="status">
                {success}
              </p>
            )}

            {/* Submit */}
            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={loading} className="px-6">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save company"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBusiness;
