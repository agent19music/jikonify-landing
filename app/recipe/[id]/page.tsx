"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Script from "next/script";

const LANDING_DOMAIN = process.env.NEXT_PUBLIC_LANDING_DOMAIN || 'jikonify.seanmotanya.dev';
const APK_URL = process.env.NEXT_PUBLIC_APK_URL || 'https://pub-b8705b045735410bb811cf444c1ed133.r2.dev/jikonify.apk';
const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL || 'https://play.google.com/store/apps/details?id=com.smartkitchen.companion';
const BRANCH_KEY = process.env.NEXT_PUBLIC_BRANCH_KEY;

interface Recipe {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  hero_image?: string;
  thumbnail_image?: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  total_time_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  servings: number;
  cuisine: string;
  ingredients: Array<{
    name: string;
    quantity?: number;
    unit?: string;
  }>;
  instructions: Array<{
    step_number: number;
    instruction: string;
  }>;
}

export default function RecipePage() {
  const params = useParams();
  const recipeId = params.id as string;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [attemptingAppOpen, setAttemptingAppOpen] = useState(true);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Check if we're in production (has Play Store URL configured)
    setIsProduction(!!process.env.NEXT_PUBLIC_PLAY_STORE_URL);
    
    // Attempt to open app
    if (BRANCH_KEY && typeof window !== 'undefined') {
      const attemptOpen = async () => {
        setAttemptingAppOpen(true);
        
        // Wait for Branch SDK to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const branch = (window as any).branch;
        if (branch) {
          try {
            branch.init(BRANCH_KEY, (err: any, data: any) => {
              if (!err && data) {
                // Try deep link
                const deepLink = `roycorecipe://recipe/${recipeId}`;
                window.location.href = deepLink;
                
                // Wait to see if app opens
                setTimeout(() => {
                  setAttemptingAppOpen(false);
                  setShowInstallDialog(true);
                }, 2000);
              } else {
                setAttemptingAppOpen(false);
                setShowInstallDialog(true);
              }
            });
          } catch (error) {
            console.error('Error opening app:', error);
            setAttemptingAppOpen(false);
            setShowInstallDialog(true);
          }
        } else {
          setAttemptingAppOpen(false);
          setShowInstallDialog(true);
        }
      };
      
      attemptOpen();
    } else {
      setAttemptingAppOpen(false);
      setShowInstallDialog(true);
    }

    // Fetch recipe data
    fetchRecipe();
  }, [recipeId]);

  const fetchRecipe = async () => {
    try {
      // TODO: Replace with actual Supabase API endpoint
      const response = await fetch(`https://${LANDING_DOMAIN}/api/recipe/${recipeId}`);
      if (response.ok) {
        const data = await response.json();
        setRecipe(data);
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = () => {
    if (isProduction) {
      window.open(PLAY_STORE_URL, '_blank');
    } else {
      window.location.href = APK_URL;
    }
  };

  const handleViewOnWeb = () => {
    setShowInstallDialog(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
          <p className="text-muted-foreground">The recipe you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {BRANCH_KEY && (
        <Script
          src="https://cdn.branch.io/branch-latest.min.js"
          strategy="afterInteractive"
        />
      )}
      
      <div className="min-h-screen bg-background">
        {/* Attempting App Open Spinner */}
        {attemptingAppOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Opening in app...</p>
            </div>
          </div>
        )}

        {/* Install Dialog */}
        {showInstallDialog && !attemptingAppOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: '#21412F' }}>
                Install Jikonify
              </h2>
              <p className="text-muted-foreground text-center mb-6">
                Get the full recipe experience in our app!
              </p>
              <button
                onClick={handleInstall}
                className="w-full px-6 py-4 rounded-xl font-semibold text-white text-lg shadow-lg hover:shadow-xl transition-all mb-4"
                style={{ backgroundColor: '#21412F' }}
              >
                {isProduction ? 'Get on Google Play' : 'Download APK'}
              </button>
              <button
                onClick={handleViewOnWeb}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View on Web
              </button>
            </div>
          </div>
        )}

        {/* Recipe Content */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Recipe Image */}
          {recipe.hero_image && (
            <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
              <Image
                src={recipe.hero_image}
                alt={recipe.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Recipe Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                {recipe.cuisine}
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                {recipe.difficulty}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#21412F' }}>
              {recipe.title}
            </h1>
            {recipe.summary && (
              <p className="text-xl text-muted-foreground mb-6">{recipe.summary}</p>
            )}
            
            <div className="flex flex-wrap gap-6 text-muted-foreground">
              <div>
                <span className="font-semibold">Time:</span> {recipe.total_time_minutes} min
              </div>
              <div>
                <span className="font-semibold">Servings:</span> {recipe.servings}
              </div>
            </div>
          </div>

          {/* Description */}
          {recipe.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#21412F' }}>
                About
              </h2>
              <p className="text-muted-foreground leading-relaxed">{recipe.description}</p>
            </div>
          )}

          {/* Ingredients */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#21412F' }}>
              Ingredients
            </h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-foreground">
                    {ingredient.quantity && ingredient.unit
                      ? `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`
                      : ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#21412F' }}>
              Instructions
            </h2>
            <ol className="space-y-4">
              {recipe.instructions.map((step) => (
                <li key={step.step_number} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                    {step.step_number}
                  </span>
                  <span className="text-foreground leading-relaxed">{step.instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}

