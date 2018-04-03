import { GitHubClientFactory } from '..';

async function run() {
  const token = <string>process.env['GITHUB_TOKEN'];
  const factory = new GitHubClientFactory(token);
  const client = await factory.connect();

  client.currentUser().then(console.log);
  client.codeSearch({ query: 'OctoKit' }).then(console.log);
}

run();
