import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      setSession(data.session);
      setLoading(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => {
    subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
