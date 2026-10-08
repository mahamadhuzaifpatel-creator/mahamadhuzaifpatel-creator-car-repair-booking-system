import { useCallback, useEffect, useState } from "react";

// Runs a loader function when the page opens and keeps track of
// its loading, error and data states.
//
// Pass a function defined outside the component (for example one of the
// functions in src/services) so it is not re-created on every render.
export function useAsync(loader) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setData(await loader());
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err.message || "Unable to load data.");
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, setData, loading, error, reload: load };
}
