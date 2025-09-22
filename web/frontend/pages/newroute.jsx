import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function NewRoute() {
  const { t } = useTranslation();
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    const getMessage = async () => {
      try {
        const res = await fetch("http://localhost:3000/new-route");

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.text();
        console.log("Fetched data:", data);
        setMessage(data);
      } catch (err) {
        setMessage("Error: " + err.message);
        console.error("Fetch error:", err);
      }
    };

    getMessage();
  }, []);

  return <h1>{message}</h1>;
}