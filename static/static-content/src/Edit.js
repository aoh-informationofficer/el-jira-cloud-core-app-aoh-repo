import React, {useState, useEffect} from 'react';
import Form, { Field } from '@atlaskit/form';
import TextArea from '@atlaskit/textarea'
import Button, { ButtonGroup } from '@atlaskit/button';
import { view } from '@forge/bridge';

function Edit() {
  const onSubmit = (formData) => view.submit(formData);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState();

  useEffect(() => {
    async function fetchViewData() {
      try {
        setLoading(true);
        const res = await view.getContext();
        const {content} = res.extension.gadgetConfiguration;
        setContent(content);
      } catch (err) {
          console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchViewData();
    
  }, []);

  return (
    <>
      {!loading ? <Form onSubmit={onSubmit}>
        {({ formProps, submitting }) => (
          <form {...formProps} style={{ maxHeight: '100vh' }}>
            <Field name="content" label="Content" defaultValue={content} maxHeight='100vh'>
              {({ fieldProps }) => <TextArea {...fieldProps} />}
            </Field>
            <br/>
            <ButtonGroup>
              <Button type="submit" isDisabled={submitting}>Save</Button>
              <Button appearance="subtle" onClick={view.close}>Cancel</Button>
            </ButtonGroup>
          </form>
        )}
      </Form> : <div>Loading...</div> }
    </>
  );
}

export default Edit;
