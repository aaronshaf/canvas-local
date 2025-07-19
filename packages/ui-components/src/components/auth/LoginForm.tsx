import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import {
  Button,
  TextInput,
  FormField,
  FormFieldMessage,
  View,
  Flex,
  Heading,
  Text,
  Alert,
  Link,
  Spinner,
} from '@instructure/ui';

export interface LoginFormProps {
  onLogin: (domain: string, email: string, apiKey: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const LoginForm: FC<LoginFormProps> = ({ onLogin, isLoading = false, error = null }) => {
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [domainError, setDomainError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');

  const validateDomain = (value: string): boolean => {
    if (!value) {
      setDomainError('Canvas domain is required');
      return false;
    }

    // Accept domain with or without protocol
    const domainWithProtocol = value.startsWith('http') ? value : `https://${value}`;

    try {
      const parsedUrl = new URL(domainWithProtocol);
      if (!parsedUrl.protocol.startsWith('https')) {
        setDomainError('Domain must use HTTPS');
        return false;
      }
      setDomainError('');
      return true;
    } catch {
      setDomainError('Please enter a valid domain');
      return false;
    }
  };

  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError('Email or username is required');
      return false;
    }
    // Basic validation - just check if not empty
    // Canvas usernames don't have to be email addresses
    setEmailError('');
    return true;
  };

  const validateApiKey = (value: string): boolean => {
    if (!value) {
      setApiKeyError('API key is required');
      return false;
    }
    if (value.length < 20) {
      setApiKeyError('API key appears to be invalid');
      return false;
    }
    setApiKeyError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const isDomainValid = validateDomain(domain);
    const isEmailValid = validateEmail(email);
    const isApiKeyValid = validateApiKey(apiKey);

    if (isDomainValid && isEmailValid && isApiKeyValid) {
      // Ensure domain has https:// (or http:// for test domain)
      const fullDomain = domain.startsWith('http')
        ? domain
        : domain === 'canvas-web.inseng.test'
          ? `http://${domain}`
          : `https://${domain}`;
      await onLogin(fullDomain, email, apiKey);
    }
  };

  return (
    <View as="div" maxWidth="28rem" margin="0 auto" padding="large">
      <Flex direction="column" gap="medium">
        <View textAlign="center" margin="0 0 large 0">
          <Heading level="h1" margin="0 0 small 0">
            Welcome to Panda
          </Heading>
          <Text color="secondary">Connect to your Canvas instance to get started</Text>
        </View>

        {error && (
          <Alert variant="error" margin="0 0 medium 0">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="medium">
            <FormField
              id="domain"
              label="Canvas Domain"
              required
              messages={domainError ? [{ text: domainError, type: 'error' }] : []}
            >
              <TextInput
                placeholder="canvas.instructure.com"
                value={domain}
                onChange={(_e, value) => setDomain(value)}
                required
                disabled={isLoading}
              />
              <FormFieldMessage>
                Enter your Canvas domain (e.g., school.instructure.com)
              </FormFieldMessage>
            </FormField>

            <FormField
              id="email"
              label="Email or Username"
              required
              messages={emailError ? [{ text: emailError, type: 'error' }] : []}
            >
              <TextInput
                placeholder="your.email@school.edu"
                value={email}
                onChange={(_e, value) => setEmail(value)}
                required
                disabled={isLoading}
              />
              <FormFieldMessage>Your Canvas login email or username</FormFieldMessage>
            </FormField>

            <FormField
              id="api-key"
              label="API Key"
              required
              messages={apiKeyError ? [{ text: apiKeyError, type: 'error' }] : []}
            >
              <TextInput
                type="password"
                placeholder="Enter your Canvas API key"
                value={apiKey}
                onChange={(_e, value) => setApiKey(value)}
                required
                disabled={isLoading}
              />
              <FormFieldMessage>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Open help dialog or external docs
                  }}
                >
                  How to generate an API key
                </Link>
              </FormFieldMessage>
            </FormField>

            <View margin="medium 0 0 0">
              <Button
                color="primary"
                display="block"
                type="submit"
                disabled={isLoading}
                renderIcon={
                  isLoading ? <Spinner renderTitle="Logging in" size="x-small" /> : undefined
                }
              >
                {isLoading ? 'Connecting...' : 'Connect to Canvas'}
              </Button>
            </View>
          </Flex>
        </form>

        <View borderWidth="small 0 0 0" padding="medium 0 0 0" textAlign="center">
          <Text size="small" color="secondary">
            Panda is not affiliated with Instructure Inc.
          </Text>
        </View>
      </Flex>
    </View>
  );
};
