"use client";

import * as React from "react";
import { Link } from "react-router-dom";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleDashedIcon,
} from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/context/AuthContext";

export function NavigationMenuDemo() {
  const { authFetch } = useAuth();
  const [businessId, setBusinessId] = React.useState<number | null>(null);

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
        // User has no business yet
      }
    })();
  }, []);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Business</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-96">
              <ListItem to="/business/add" title="Add Company">
                Add your company and start managing your business effectively.
              </ListItem>
              {businessId && (
                <>
                  <ListItem
                    to={`/business/edit/${businessId}`}
                    title="Edit company data"
                  >
                    Edit your companies data
                  </ListItem>
                  <ListItem
                    to={`/business/delete/${businessId}`}
                    title="Delete company"
                  >
                    Delete company and it's data
                  </ListItem>
                </>
              )}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:flex">
          <NavigationMenuTrigger>Clients</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-96">
              <ListItem to="/clients/add" title="Add Clients">
                Add your clients and start managing your business effectively.
              </ListItem>
              <>
                <ListItem to={`/clients`} title="All clients">
                  All clients
                </ListItem>
                <ListItem
                  to={`/clients/delete/${businessId}`}
                  title="Delete clients"
                >
                  Delete company and it's data
                </ListItem>
              </>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({
  title,
  children,
  to,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { to: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink
        render={
          <Link to={to}>
            <div className="flex flex-col gap-1 text-sm">
              <div className="leading-none font-medium">{title}</div>
              <div className="line-clamp-2 text-muted-foreground">
                {children}
              </div>
            </div>
          </Link>
        }
      />
    </li>
  );
}
