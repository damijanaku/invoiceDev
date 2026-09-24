import { Mail, Loader2, Users } from "lucide-react";
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

type ClientForm = {
  company_name: string;
  contact_person: string;
  email: string;
  phone_number: string;
  address: string;
  tax_id: string;
  registration_number: string;
};

const initialForm: ClientForm = {
  company_name: "",
  contact_person: "",
  email: "",
  phone_number: "",
  address: "",
  tax_id: "",
  registration_number: "",
};

const EditClient = () => {
  const { id } = useParams<{ id: string }>();
  const { authFetch } = useAuth();
  const [form, setForm] = useState<ClientForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await authFetch(
          `http://localhost:3000/api/v1/clients/${id}`
        );
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || "Failed to load client");
        }
        const { client } = await res.json();
        setForm({
          company_name: client.company_name ?? "",
          contact_person: client.contact_person ?? "",
          email: client.email ?? "",
          phone_number: client.phone_number ?? "",
          address: client.address ?? "",
          tax_id: client.tax_id ?? "",
          registration_number: client.registration_number ?? "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load client");
      } finally {
        setFetching(false);
      }
    })();
  }, [id, authFetch]);

  const handleChange =
    (key: keyof ClientForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
        `http://localhost:3000/api/v1/clients/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to update client");
      }

      setSuccess("Client updated successfully!");
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
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Edit client</h1>
          </div>
          <p className="text-sm text-gray-500 mb-8 ml-12">
            Update the client's contact and billing details.
          </p>

          {fetching ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading client…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Company name */}
              <Field className="w-full">
                <FieldLabel
                  htmlFor="company_name"
                  className="text-sm font-medium text-gray-700"
                >
                  Company name
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="company_name"
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange("company_name")}
                    required
                  />
                </InputGroup>
              </Field>

              {/* Contact person */}
              <Field className="w-full">
                <FieldLabel
                  htmlFor="contact_person"
                  className="text-sm font-medium text-gray-700"
                >
                  Contact person
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="contact_person"
                    name="contact_person"
                    value={form.contact_person}
                    onChange={handleChange("contact_person")}
                    required
                  />
                </InputGroup>
              </Field>

              {/* Address */}
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

              {/* Tax ID + Registration number */}
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel
                    htmlFor="tax_id"
                    className="text-sm font-medium text-gray-700"
                  >
                    Tax ID
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="tax_id"
                      name="tax_id"
                      value={form.tax_id}
                      onChange={handleChange("tax_id")}
                      required
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="registration_number"
                    className="text-sm font-medium text-gray-700"
                  >
                    Registration number
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="registration_number"
                      name="registration_number"
                      value={form.registration_number}
                      onChange={handleChange("registration_number")}
                      required
                    />
                  </InputGroup>
                </Field>
              </div>

              {/* Phone + Email */}
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel
                    htmlFor="phone_number"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone number
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      value={form.phone_number}
                      onChange={handleChange("phone_number")}
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
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      required
                    />
                    <InputGroupAddon align="inline-end">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              </div>

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
                    "Save client"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditClient;
