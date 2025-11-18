import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';

function View() {
  const [context, setContext] = useState();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      setLoading(true);
      invoke('getStaticContent').then(setData);
    } catch (err) {
      console.erorr(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      setLoading(true);
      view.getContext().then(setContext);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  if (!context || (!data && loading)) {
    return "Loading..."
  }

  return (
    <div style={{ whiteSpace: 'pre-wrap' }}>
      {data}
    </div>
  );
}

export default View;
