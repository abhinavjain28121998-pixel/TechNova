import { SEO } from '../components/SEO';

export default function TermsOfService() {
  return (
    <>
      <SEO 
        title="Terms of Service | TechNova"
        description="Read the Terms of Service and user agreements for the TechNova blog."
        keywords={['terms of service', 'TechNova terms', 'user agreement']}
        url="https://tech-nova-iota.vercel.app/terms-of-service"
      />
      <div className="bg-background min-h-screen py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">Terms of Service</h1>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p className="lead text-xl mb-8">Last updated: April 20, 2026</p>
            
            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">1. Acceptance of Terms</h2>
            <p className="mb-6">
              By accessing and using the TechNova website, you accept and agree to be bound by the terms and provision of this agreement. 
              In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">2. Description of Service</h2>
            <p className="mb-6">
              TechNova provides users with access to a rich collection of resources, including technology blogs, tutorials, industry news, and 
              AI developments. You understand and agree that the service is provided "AS-IS" and that TechNova assumes no responsibility for 
              the timeliness, deletion, mis-delivery, or failure to store any user communications or personalization settings.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">3. User Conduct</h2>
            <p className="mb-6">
              You agree to use the website only for lawful purposes. You agree not to take any action that might compromise the security of the site,
              render the site inaccessible to others or otherwise cause damage to the site or the content.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
