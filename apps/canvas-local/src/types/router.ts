export interface RouterContext {
  auth: {
    authState: {
      isAuthenticated: boolean;
      user: {
        id: string;
        name: string;
        email: string;
      } | null;
      domain: string | null;
    };
  };
}