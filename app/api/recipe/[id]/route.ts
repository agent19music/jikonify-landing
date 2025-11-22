import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface SupabaseRecipe {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  hero_image?: string;
  thumbnail_image?: string;
  additional_images?: string[];
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  total_time_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  servings: number;
  serving_size?: string;
  nutrition?: any;
  estimated_cost_kes?: number;
  cuisine: string;
  course?: string[];
  meal_type?: string[];
  occasion?: string[];
  dietary_tags?: string[];
  author_id?: string;
  source: 'curated' | 'ai' | 'user' | 'community';
  source_url?: string;
  original_author?: string;
  social_media?: any;
  video_url?: string;
  ai_generated: boolean;
  rating_average: number;
  rating_count: number;
  favorite_count: number;
  view_count: number;
  cook_count: number;
  share_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface SupabaseIngredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity?: number;
  unit?: string;
  group?: string;
  order_index: number;
  note?: string;
}

interface SupabaseStep {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  time_minutes?: number;
  tip?: string;
  image_url?: string;
}

function transformRecipe(
  recipe: SupabaseRecipe,
  ingredients: SupabaseIngredient[] = [],
  steps: SupabaseStep[] = []
) {
  return {
    id: recipe.id,
    title: recipe.title,
    summary: recipe.summary,
    description: recipe.description,
    hero_image: recipe.hero_image,
    thumbnail_image: recipe.thumbnail_image,
    prep_time_minutes: recipe.prep_time_minutes,
    cook_time_minutes: recipe.cook_time_minutes,
    total_time_minutes: recipe.total_time_minutes,
    difficulty: recipe.difficulty,
    servings: recipe.servings,
    cuisine: recipe.cuisine,
    ingredients: ingredients.map(ing => ({
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
    })),
    instructions: steps.map(step => ({
      step_number: step.step_number,
      instruction: step.instruction,
    })),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recipeId } = await params;

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Fetch recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .eq('is_published', true)
      .single();

    if (recipeError || !recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Fetch ingredients and steps
    const [ingredientsResult, stepsResult] = await Promise.all([
      supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('order_index'),
      supabase
        .from('recipe_steps')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('step_number'),
    ]);

    if (ingredientsResult.error) {
      console.error('Error fetching ingredients:', ingredientsResult.error);
    }
    if (stepsResult.error) {
      console.error('Error fetching steps:', stepsResult.error);
    }

    const transformedRecipe = transformRecipe(
      recipe as SupabaseRecipe,
      (ingredientsResult.data || []) as SupabaseIngredient[],
      (stepsResult.data || []) as SupabaseStep[]
    );

    return NextResponse.json(transformedRecipe);
  } catch (error) {
    console.error('Error in recipe API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

