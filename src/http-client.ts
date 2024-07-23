export namespace HttpClient {
  export const request = async <A>(url: string): Promise<A> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const message: string = await response.text();
        return Promise.reject(new Error(`Request failed with status ${response.status}: ${message}`));
      }
      return await response.json() as unknown as A;
    } catch (error) {
      return Promise.reject(error);
    }
  };
}
