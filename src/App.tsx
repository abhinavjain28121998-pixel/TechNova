import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from './components/Layout';
import { ThemeProvider } from './components/ThemeProvider';

const Home = lazy(() => import('./pages/Home'));
const Blog = lazy(() => import('./pages/Blog'));
const Post = lazy(() => import('./pages/Post'));
const Categories = lazy(() => import('./pages/Categories'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Admin = lazy(() => import('./pages/Admin'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <HelmetProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="flex h-screen items-center justify-center p-4">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:slug" element={<Post />} />
                <Route path="categories" element={<Categories />} />
                <Route path="case-studies" element={<CaseStudies />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                <Route path="terms" element={<TermsOfService />} />
                <Route path="admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </HelmetProvider>
    </ThemeProvider>
  );
}
