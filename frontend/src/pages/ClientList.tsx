import { NavigationMenuDemo } from "@/components/ui/navbar";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { TbDotsVertical } from "react-icons/tb";

const ClientList = () => {
  const { accessToken } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (!accessToken) return;

    const controller = new AbortController();

    const fetchClients = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("http://localhost:3000/api/v1/clients", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        const data = await res.json();
        console.log("API response:", data);

        if (!res.ok) {
          throw new Error(data?.message || `Request failed: ${res.status}`);
        }

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.clients)
          ? data.clients
          : [];

        setClients(list);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError(err.message);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();

    return () => controller.abort();
  }, [accessToken]);

  const filtered = (Array.isArray(clients) ? clients : []).filter((c) => {
    const q = search.toLowerCase();
    return (
      String(c.company_name ?? "")
        .toLowerCase()
        .includes(q) ||
      String(c.contact_person ?? "")
        .toLowerCase()
        .includes(q) ||
      String(c.email ?? "")
        .toLowerCase()
        .includes(q)
    );
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client? This cannot be undone.")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/v1/clients/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || `Delete failed: ${res.status}`);
      }
      setClients((prev) => prev.filter((c) => c.id !== id));
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete client");
    }
  };

  return (
    <div>
      <div className="flex justify-center m-4">
        <NavigationMenuDemo />
      </div>

      <div className="my-4 mx-8">
        {/* Header row */}
        <div className="flex justify-between items-center m-6 p-2">
          <span className="font-semibold text-lg">Clients</span>
          <a
            href="/clients/add"
            className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-200"
          >
            Add Client
          </a>
        </div>

        {/* Search + count */}
        <div className="flex border border-gray-200 rounded-2xl p-4 shadow-sm justify-between m-6 items-center">
          <div className="flex items-center gap-2 text-gray-500 bg-gray-100 rounded-md px-4 py-2">
            <FaMagnifyingGlass />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients"
              className="bg-transparent outline-none text-sm"
            />
          </div>
          <div className="text-sm text-gray-500">
            Showing {filtered.length} clients
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm m-6">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-medium">Client Name</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    Loading…
                  </td>
                </tr>
              )}

              {error && !loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-6 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    No clients found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filtered.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {client.company_name || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {client.contact_person || client.email || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {/* Placeholder */}
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500">
                        —
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => toggleMenu(client.id)}
                          className="p-1 rounded hover:bg-gray-100"
                          aria-label="Actions"
                        >
                          <TbDotsVertical className="text-gray-500 hover:text-gray-700" />
                        </button>

                        {openMenuId === client.id && (
                          <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <a
                              href={`/clients/${client.id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              View
                            </a>
                            <a
                              href={`/clients/edit/${client.id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Edit
                            </a>
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="w-full text-left block px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientList;
