import { supabase }
from "@/lib/supabase/client";

export interface KnowledgeNode {
  id: string;
  title: string;
  content: string;
}

export const getKnowledgeNodes =
  async (): Promise<
    KnowledgeNode[]
  > => {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "knowledge_nodes"
        )
        .select("*");

    if (error) {
      throw error;
    }

    return data || [];
  };