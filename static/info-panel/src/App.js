import React, { useEffect, useState } from 'react';
import Banner from '@atlaskit/banner';
import WarningIcon from '@atlaskit/icon/core/status-warning';
import { invoke } from '@forge/bridge';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchHighlights() {
      try {
        setLoading(true);
        const reqData = await invoke('getInfoPanelData');
        setData(reqData);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHighlights();
  }, []);

  console.log("data");
  console.log(data);
  
  return (
    <>
      {loading ? <div>Loading...</div> : 
      <main role="main" id="main">
        <div class="row pb-3" id="highlights">
          <div class="col-12 pb-1">
            {data?.statements?.length > 0 &&
            <>
              <Banner
                appearance="warning"
                icon={<WarningIcon label="Warning" />}
              >
                { data.type === "Story" &&
                    <span>Implementation Type for this story does not match its epic.<br/></span>
                }
                {
                  data.type === "Epic" &&
                  <span>Implementation Type for these children do not match:<br/></span>
                }
              </Banner>
              {
                data.statements.map(issue => (
                  <ul>
                    <li style={{"font-size":"12px"}}>{issue}</li>
                  </ul>
                ))
              }
            </>
            }
          </div>
        </div>
      </main>
      }
    </>
  );
}

export default App;
