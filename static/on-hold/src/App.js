import React, { useEffect, useState } from 'react';
import Form, { Field } from '@atlaskit/form';
import Button, { ButtonGroup } from '@atlaskit/button';
import { invoke, view } from '@forge/bridge';
import TextArea from '@atlaskit/textarea'
import Toggle from '@atlaskit/toggle';
import Select from 'react-select';
import Banner from '@atlaskit/banner';
import Spinner from '@atlaskit/spinner';
import WarningIcon from '@atlaskit/icon/core/status-warning';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [reasonCodeList, setReasonCodeList] = useState([]);
  const [reasonCode, setReasonCode] = useState("");
  const [onHoldBy, setOnHoldBy] = useState(null);
  const [readOnly, setReadOnly] = useState(true);
  const [user, setUser] = useState("");
  const [error, setError] = useState("");
  const onSubmit = async (formData) => {
    const {reasonCode, onHold = false, onHoldReason} = formData;
    if ((onHold && !reasonCode) || !reasonCode || !onHoldReason) {
      setError("Please fill in all required fields before submitting.");
    } else {
      const status = await invoke("postIssueOnHoldUpdate", {formData: formData, bsa: data.fields.customfield_14969 });
      if (status >= 400) {
        setError("Uh Oh! Error trying to check user's project roles.");
      } else {
        view.close();
      }
    }
  };

  useEffect(() => {
    async function fetchIssueData() {
      try {
        setLoading(true);
        const currentUser = await invoke("getCurrentUserWithRole", {role: 10400});
        const issue = await invoke("getIssue");
        const reasonCodeValues = await invoke("getFieldDefaultValues", {field : "customfield_15086"});
        const status = issue.fields.status.name
        if (currentUser.project.substring(0,3) === "JDE" || currentUser.project === "EQMSCCR") {
          if (status === "Open" || status === "Pre-System Test") {
            setReadOnly(false);
          }
        } else {
          if (status == "Done" || status == "Cancelled") {
            setError(`Invalid workflow status.`);
          } else {
            setReadOnly(false);
          }
        }
        setData(issue);
        setChecked(issue.fields.customfield_15087?.value === "Yes" ? true : false);
        setOnHoldBy(issue.fields.customfield_15088?.accountId || null);
        setReasonCodeList(reasonCodeValues);
        setReasonCode(reasonCodeValues.find(code => code.label === issue.fields.customfield_15086?.value) || "");
        setUser(currentUser.accountId);

        const validIssueTypes = ['Improvement', 'Story', 'Bug'];
        if (!validIssueTypes.includes(issue.fields.issuetype.name)) {
          setError(`Invalid issue type. Accepted values: ${validIssueTypes.join(", ")}.`);
        } else if (!issue.fields.customfield_14969) {
          setError(`Please remember to update missing "Business System Analyst" field.`);
        } else if (user != onHoldBy && user != issue.fields.customfield_14969 && !currentUser.foundRole) {
          setError(`Un-hold restricted to On-Hold user, Architect, or Business System Analyst.`)
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchIssueData();
  }, []);

  const handlerSelectedCfValue = (selectedCfValue) => {
    setReasonCode(selectedCfValue);
  };

  return (
    <div style={{"margin": "15px", "overflow": "visible", "minWidth": "600px"}}>
      <h1><strong>On Hold</strong></h1>
      <br />
      {loading && <Spinner label="Loading" />}
      {error != "" && <Banner appearance="warning" icon={<WarningIcon label="Warning" />}><span><b>{error}</b></span></Banner>}
      {data && !loading && error == "" &&
      <Form onSubmit={onSubmit}>
        {({ formProps, submitting }) => (
          <form {...formProps}> 
            <Field label="On Hold" name="onHold" isRequired={true} isDisabled={readOnly} >
              {({ fieldProps }) => <><br /><Toggle isChecked={checked} size="large" {...fieldProps} onChange={() => {
                const newValue = !checked;
                setChecked(newValue);
                fieldProps.onChange(newValue);
                }} /></>}
            </Field>
            <Field 
              label="Reason Code"
              name = "reasonCode"
              defaultValue={reasonCode}
              isRequired = {checked}
              isDisabled = {readOnly ? true : checked === false}
            >
            {({ fieldProps }) => (
              <Select
                isDisabled = {!checked}
                className="multi-select"
                classNamePrefix="react-select"
                closeMenuOnSelect={true}
                value = {reasonCode}
                isSearchable
                onChange={(e) => handlerSelectedCfValue(e)}
                options={[{label: "None", value: null}, ...reasonCodeList]}
                menuPortalTarget={document.body}   // ensures dropdown escapes parent content
                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                {...fieldProps}
              />       
            )}
          </Field>
            <Field isReadOnly={readOnly} name="onHoldReason" label="Comment" resize="auto" maxHeight="20vh" isRequired={true}>
              {({ fieldProps }) => <TextArea {...fieldProps} />}
            </Field>
            <br/>
            <ButtonGroup>
              <Button type="submit" appearance="primary" isDisabled={submitting}>Submit</Button>
              <Button appearance="subtle" onClick={() => view.close()}>Close</Button>
            </ButtonGroup>
          </form>
        )}
      </Form>}
    </div>
  );
}

export default App;
