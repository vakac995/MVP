import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@/auth/AuthProvider";
import { Loader } from "lucide-react";

// Layout components (load immediately)
import AppLayout from "./layout/AppLayout";

// Lazy load all pages for better performance
const HomePage = React.lazy(() => import("./pages/HomePage"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const ProjectsPage = React.lazy(() => import("./pages/ProjectsPage"));
const ProjectDetailPage = React.lazy(() => import("./pages/ProjectDetailPage"));
const ForumPage = React.lazy(() => import("./pages/ForumPage"));
const ThreadPage = React.lazy(() => import("./pages/ThreadPage"));
const SearchPage = React.lazy(() => import("./pages/SearchPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const CreateProjectPage = React.lazy(() => import("./pages/CreateProjectPage"));
const EditProjectPage = React.lazy(() => import("./pages/EditProjectPage"));
const RegistrationPage = React.lazy(() => import("./pages/RegistrationPage"));

// Loading component for page transitions
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex items-center space-x-2">
      <Loader className="h-5 w-5 animate-spin" />
      <span className="text-sm text-muted-foreground">Loading page...</span>
    </div>
  </div>
);

export default function Router() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {/* Public routes - accessible to all users */}
          <Route index element={
            <Suspense fallback={<PageLoader />}>
              <HomePage />
            </Suspense>
          } />
          <Route path="projects" element={
            <Suspense fallback={<PageLoader />}>
              <ProjectsPage />
            </Suspense>
          } />
          <Route path="projects/:projectId" element={
            <Suspense fallback={<PageLoader />}>
              <ProjectDetailPage />
            </Suspense>
          } />
          <Route path="forum" element={
            <Suspense fallback={<PageLoader />}>
              <ForumPage />
            </Suspense>
          } />
          <Route path="forum/:timelineItemId" element={
            <Suspense fallback={<PageLoader />}>
              <ThreadPage />
            </Suspense>
          } />
          <Route path="about" element={
            <Suspense fallback={<PageLoader />}>
              <AboutPage />
            </Suspense>
          } />
          <Route path="search" element={
            <Suspense fallback={<PageLoader />}>
              <SearchPage />
            </Suspense>
          } />
          
          {/* Protected routes - only for authenticated users */}
          <Route path="profile" element={
            <SignedIn>
              <Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </Suspense>
            </SignedIn>
          } />
          
          <Route path="projects/create" element={
            <SignedIn>
              <Suspense fallback={<PageLoader />}>
                <CreateProjectPage />
              </Suspense>
            </SignedIn>
          } />
          
          <Route path="register" element={
            <Suspense fallback={<PageLoader />}>
              <RegistrationPage />
            </Suspense>
          } />
          
          <Route path="projects/:projectId/edit" element={
            <SignedIn>
              <Suspense fallback={<PageLoader />}>
                <EditProjectPage />
              </Suspense>
            </SignedIn>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}