import { NavigationMenuDemo } from "@/components/ui/navbar";
import React, { useState } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Building2, Loader2, Mail } from "lucide-react";
import { Users } from "lucide-react";

const AddClient = () => {
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [businessId, setBusinessId] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await authFetch("http://localhost:3000/api/v1/businesses/");
        if (!res.ok) return;
        const data = await res.json();
        if (data.businesses?.length > 0) {
          setBusinessId(data.businesses[0].id);
        }
      } catch {
        // no business yet
      }
    })();
  }, [authFetch]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!businessId) {
      setError("You need to add a business first.");
      return;
    }

    const formData = new FormData(e.currentTarget);

    const payload = {
      business_id: businessId,
      company_name: formData.get("company_name"),
      contact_person: formData.get("contact_person"),
      email: formData.get("email"),
      phone_number: formData.get("phone_number"),
      address: formData.get("address"),
      tax_id: formData.get("tax_id"),
      registration_number: formData.get("registration_number"),
    };

    setLoading(true);
    try {
      const res = await authFetch("http://localhost:3000/api/v1/clients/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to add client");
      }

      setSuccess("Client added successfully!");
      (e.target as HTMLFormElement).reset();
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
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Add client to your Company
            </h1>
          </div>

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
                <InputGroupAddon align="inline-start">
                  <Building2 className="h-4 w-4 text-gray-400" />
                </InputGroupAddon>
                <InputGroupInput
                  id="company_name"
                  name="company_name"
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
                <InputGroupInput id="address" name="address" required />
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
                  <InputGroupInput id="tax_id" name="tax_id" required />
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
              <Button
                type="submit"
                disabled={loading || !businessId}
                className="px-6"
              >
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
        </div>
      </div>
    </div>
  );
};

export default AddClient;
