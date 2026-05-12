import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin, Result, theme } from 'antd';
import { UseAuth } from '@contexts/AuthContext';
import { USER_ROLES } from '@stores/constants';
import { OmniRomRomPatientResult } from '@stores/interfaces';

interface WithAuthOptions {
  requiredRoles?: string[];
  fallbackPath?: string;
  allowPublicAccess?: boolean;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRequiredRole: boolean;
  userRole: string | null;
}

/**
 * Higher-Order Component that provides authentication and authorization
 * for the ImageAnnotation component
 */
export function withAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options: WithAuthOptions = {}
) {
  const {
    requiredRoles = [USER_ROLES.ADMIN],
    fallbackPath = '/login',
    allowPublicAccess = false
  } = options;

  const AuthenticatedComponent = (props: T) => {
    const { credentials, isAuthenticated, isLoading } = UseAuth();
    const { token } = theme.useToken();
    const [authState, setAuthState] = useState<AuthState>({
      isLoading: true,
      isAuthenticated: false,
      hasRequiredRole: false,
      userRole: null
    });

    useEffect(() => {
      const checkAuth = () => {
        // If public access is allowed, no authentication required
        if (allowPublicAccess) {
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            hasRequiredRole: true,
            userRole: 'public'
          });
          return;
        }

        // Check if user is authenticated
        if (isLoading) {
          setAuthState(prev => ({ ...prev, isLoading: true }));
          return;
        }

        if (!isAuthenticated || !credentials) {
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            hasRequiredRole: false,
            userRole: null
          });
          return;
        }

        // Check if user has required role
        const userRoles = credentials.roles || [];
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
        
        // Extract primary role for display
        const primaryRole = userRoles.find(role => 
          Object.values(USER_ROLES).includes(role as string)
        ) || userRoles[0];

        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          hasRequiredRole,
          userRole: primaryRole
        });
      };

      checkAuth();
    }, [isAuthenticated, isLoading, credentials]);

    // Show loading spinner while checking authentication
    if (authState.isLoading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          <Spin size="large" />
        </div>
      );
    }

    // Redirect to login if not authenticated
    if (!authState.isAuthenticated) {
      return <Navigate to={fallbackPath} replace />;
    }

    // Show access denied if user doesn't have required role
    if (!authState.hasRequiredRole) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          <Result
            status="403"
            title="Access Denied"
            subTitle={`You need ${requiredRoles.join(' or ')} role to access this page. Your current role: ${authState.userRole}`}
            extra={
              <div style={{
                fontSize: 'var(--font-size-sm)',
                color: token.colorTextSecondary
              }}>
                Please contact your administrator if you believe this is an error.
              </div>
            }
          />
        </div>
      );
    }

    // Pass authentication context to wrapped component
    const authProps = {
      user: {
        credentials,
        isAuthenticated: authState.isAuthenticated,
        role: authState.userRole,
        hasRole: (role: string) => credentials?.roles?.includes(role) || false
      }
    };

    return <WrappedComponent {...props} {...authProps} />;
  };

  // Set display name for debugging
  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
}

// Type for components that use the withAuth HOC
export interface WithAuthProps {
  user: {
    credentials: unknown;
    isAuthenticated: boolean;
    role: string | null;
    hasRole: (role: string) => boolean;
  };
  image: string;
  imageUrl: string;
  record: OmniRomRomPatientResult;
  canvasLoading: boolean;
  setCanvasLoading: (value : boolean) => void;
  handleCancel : () => void;
  fetchSessionData?: (value: string) => void;
}