/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as AuthenticatedRouteImport } from './routes/_authenticated'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AuthenticatedDashboardRouteImport } from './routes/_authenticated.dashboard'
import { Route as AuthenticatedCoursesRouteImport } from './routes/_authenticated.courses'
import { Route as AuthenticatedCoursesCourseIdRouteImport } from './routes/_authenticated.courses.$courseId'

const AuthenticatedRoute = AuthenticatedRouteImport.update({
  id: '/_authenticated',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthenticatedDashboardRoute = AuthenticatedDashboardRouteImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => AuthenticatedRoute,
} as any)
const AuthenticatedCoursesRoute = AuthenticatedCoursesRouteImport.update({
  id: '/courses',
  path: '/courses',
  getParentRoute: () => AuthenticatedRoute,
} as any)
const AuthenticatedCoursesCourseIdRoute =
  AuthenticatedCoursesCourseIdRouteImport.update({
    id: '/$courseId',
    path: '/$courseId',
    getParentRoute: () => AuthenticatedCoursesRoute,
  } as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/courses': typeof AuthenticatedCoursesRouteWithChildren
  '/dashboard': typeof AuthenticatedDashboardRoute
  '/courses/$courseId': typeof AuthenticatedCoursesCourseIdRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/courses': typeof AuthenticatedCoursesRouteWithChildren
  '/dashboard': typeof AuthenticatedDashboardRoute
  '/courses/$courseId': typeof AuthenticatedCoursesCourseIdRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/_authenticated': typeof AuthenticatedRouteWithChildren
  '/_authenticated/courses': typeof AuthenticatedCoursesRouteWithChildren
  '/_authenticated/dashboard': typeof AuthenticatedDashboardRoute
  '/_authenticated/courses/$courseId': typeof AuthenticatedCoursesCourseIdRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/courses' | '/dashboard' | '/courses/$courseId'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/courses' | '/dashboard' | '/courses/$courseId'
  id:
    | '__root__'
    | '/'
    | '/_authenticated'
    | '/_authenticated/courses'
    | '/_authenticated/dashboard'
    | '/_authenticated/courses/$courseId'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthenticatedRoute: typeof AuthenticatedRouteWithChildren
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_authenticated': {
      id: '/_authenticated'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthenticatedRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_authenticated/dashboard': {
      id: '/_authenticated/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof AuthenticatedDashboardRouteImport
      parentRoute: typeof AuthenticatedRoute
    }
    '/_authenticated/courses': {
      id: '/_authenticated/courses'
      path: '/courses'
      fullPath: '/courses'
      preLoaderRoute: typeof AuthenticatedCoursesRouteImport
      parentRoute: typeof AuthenticatedRoute
    }
    '/_authenticated/courses/$courseId': {
      id: '/_authenticated/courses/$courseId'
      path: '/$courseId'
      fullPath: '/courses/$courseId'
      preLoaderRoute: typeof AuthenticatedCoursesCourseIdRouteImport
      parentRoute: typeof AuthenticatedCoursesRoute
    }
  }
}

interface AuthenticatedCoursesRouteChildren {
  AuthenticatedCoursesCourseIdRoute: typeof AuthenticatedCoursesCourseIdRoute
}

const AuthenticatedCoursesRouteChildren: AuthenticatedCoursesRouteChildren = {
  AuthenticatedCoursesCourseIdRoute: AuthenticatedCoursesCourseIdRoute,
}

const AuthenticatedCoursesRouteWithChildren =
  AuthenticatedCoursesRoute._addFileChildren(AuthenticatedCoursesRouteChildren)

interface AuthenticatedRouteChildren {
  AuthenticatedCoursesRoute: typeof AuthenticatedCoursesRouteWithChildren
  AuthenticatedDashboardRoute: typeof AuthenticatedDashboardRoute
}

const AuthenticatedRouteChildren: AuthenticatedRouteChildren = {
  AuthenticatedCoursesRoute: AuthenticatedCoursesRouteWithChildren,
  AuthenticatedDashboardRoute: AuthenticatedDashboardRoute,
}

const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren,
)

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
