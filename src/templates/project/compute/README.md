# <%= projectname %>

This Salesforce DX project contains a starter compute app, built on the Heroku AppLink getting-started app, that you can run locally and deploy to a Salesforce org.

## Project Structure

- **`<%= defaultpackagedir %>/main/default/computeApps/<%= projectname %>/`** - The compute app. It contains the app's metadata file (`<%= projectname %>.computeApp-meta.xml`) next to its source code.
- **`sfdx-project.json`** - Project configuration.

## Next Steps

1. Open the app's own `README.md` for how to run it locally and add your first route.
2. Deploy it to an org:

   ```
   sf project deploy start --metadata ComputeApp:<%= projectname %> --target-org <org>
   ```
