import { Metadata } from 'next';

const LANDING_DOMAIN = process.env.NEXT_PUBLIC_LANDING_DOMAIN || 'jikonify.seanmotanya.dev';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const recipeId = params.id;
  
  // Fetch recipe data for metadata
  let recipe: any = null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${LANDING_DOMAIN}`;
    const response = await fetch(`${baseUrl}/api/recipe/${recipeId}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (response.ok) {
      recipe = await response.json();
    }
  } catch (error) {
    console.error('Error fetching recipe for metadata:', error);
  }

  const title = recipe?.title || 'Recipe on Jikonify';
  const description = recipe?.summary || recipe?.description || 'Hey! Join me, let\'s cook on Jikonify. Check out this delicious recipe!';
  const image = recipe?.hero_image || recipe?.thumbnail_image || `${process.env.NEXT_PUBLIC_BASE_URL || `https://${LANDING_DOMAIN}`}/og-image.png`;
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || `https://${LANDING_DOMAIN}`}/recipe/${recipeId}`;

  return {
    title: `${title} | Jikonify`,
    description,
    openGraph: {
      title: `${title} | Jikonify`,
      description: description,
      url,
      siteName: 'Jikonify',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Jikonify`,
      description: description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function RecipeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

