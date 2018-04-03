import fetchPonyfill from 'fetch-ponyfill';
import uriTemplate from 'uri-templates';

const { fetch, Request, Response, Headers } = fetchPonyfill();

export class GitHubClientFactory {
  token: string;

  constructor(token: string) {
    this.token = token;
  }

  connect(): Promise<GitHubClient> {
    return this.fetch('https://api.github.com');
  }

  private fetch(url: string, params: {} = {}): Promise<any> {
    let headers = new Headers({
      Authorization: `token ${this.token}`,
      'User-Agent': 'darranshepherd',
    });
    let template = uriTemplate(url);
    return fetch(template.fillFromObject(params), { headers })
      .then((resp: Response) => resp.json())
      .then(
        (json: any) =>
          Array.isArray(json)
            ? json.map(this.hydrate, this)
            : this.hydrate(json)
      );
  }

  private hydrate(json: { [key: string]: any }) {
    const output: { [key: string]: any } = {};

    for (let prop in json) {
      let name = this.normalisePropertyName(prop);

      if (prop.endsWith('_url')) {
        output[name.replace(/Url$/, '')] = (params: {}) =>
          this.fetch(json[prop], params);
      } else if (prop.endsWith('_at')) {
        output[name] = new Date(json[prop]);
      } else if (Array.isArray(json[prop])) {
        output[name] = json[prop].map(this.hydrate, this);
      } else if (typeof json[prop] === 'object') {
        output[name] = this.hydrate(json[prop]);
      } else {
        output[name] = json[prop];
      }
    }

    return output;
  }

  private normalisePropertyName(prop: string) {
    return prop.replace(/_([a-z])/gi, ($0, $1) => $1.toUpperCase());
  }
}
