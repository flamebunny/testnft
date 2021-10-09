const errorCodeWebappVersionMismatch = 551;

export function getMoviesFromApiAsync() {
  return fetch('https://facebook.github.io/react-native/movies.json')
    .then(response => response.json())
    .then(responseJson => {
      return responseJson.movies
    })
    .catch(error => {
      console.error(error)
      throw error
    })
}

export class ApiServiceError extends Error {
  response

  constructor(response) {
      super(`Fetch failed. Error code ${response.status}`);
      this.response = response;
  }
}

export function fetchFromApi(url, opts) {
  const headers = new Headers();

  const { headers: optionalHeaders, ...options } = opts || { headers: null };

  if (optionalHeaders) {
      for (const key in optionalHeaders) {
          if ((typeof key === 'string') && (typeof optionalHeaders[key] === 'string')) {
              headers.append(`${key}`, optionalHeaders[key]);
          }
      }
  }

  // Custom headers can cause CORS check to fail, so only send if URL is relative (same-origin)
  if (isRelativeUrl(url)) {
      addCustomHeaders(headers);
  }

  return window.fetch(url, { credentials: "same-origin", headers: headers, ...options })
      .then(response => {
          if (!response.ok) {
              if (response.status === errorCodeWebappVersionMismatch) {
                  window.location.reload(true);
              } else {
                  throw new ApiServiceError(response);
              }
          }
          return response;
      });
}

export function get({url, opts}) {
  return fetchFromApi(url, opts)
      .then(response => {
          return response[response.status === 204 ? 'text' : 'json']()
      });
}

export function post({ url, body }) {
  return fetchFromApi(url, getPostParameters(body))
      .then(response => {
          return response[response.status === 204 ? 'text' : 'json']()
      });
}

function isRelativeUrl(url) {
  const r = new RegExp('^(?:[a-z]+:)?//', 'i');
  return (r.test(url) === false);
}

function addCustomHeaders(headers) {
  headers.append("X-App-Version", '');
  headers.append("X-Location", '');
  headers.append("X-Venue", '');
}

export function getPostParameters(request) {
  return {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
      }
  };
}



