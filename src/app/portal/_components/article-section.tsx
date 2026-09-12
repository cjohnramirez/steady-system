"use client";

import { useQuery } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import { fetchArticlesByEmotion } from "../actions";
import { createClient } from "@/utils/supabase/client";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { ChevronLeft, ChevronRight, CircleOff, Search } from "lucide-react";
import { Tables } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/hooks/auth-store";
import ArticleTile from "./article-tile";
import Link from "next/link";

export default function ArticleSection() {
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 3,
  });

  const userEmotionalStatus = useUserStore().emotionalStatus;

  const { data: articles, isLoading } = useQuery({
    queryKey: [
      "articles",
      pagination.pageIndex,
      pagination.pageSize,
      search,
      userEmotionalStatus,
    ],
    queryFn: () =>
      fetchArticlesByEmotion(
        supabase,
        pagination.pageIndex,
        pagination.pageSize,
        search,
        userEmotionalStatus,
      ),
  });

  const list: Tables<"article">[] = articles?.data || [];
  const count = articles?.count;

  return (
    <section className="flex h-fit flex-col gap-4" id="articles">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Articles</p>
          <p>
            View all articles, curated based on your emotional status (you can
            change it{" "}
            <Link href="student/">
              <u className="cursor-pointer">here</u>
            </Link>
            )
          </p>
        </div>
        <InputGroup className="w-fit bg-white px-2">
          <Search strokeWidth={1.25} />
          <InputGroupInput
            placeholder="Search by title"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
        </InputGroup>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <ArticleTile key={`skeleton-${idx}`} isLoading={true} />
          ))}
        </div>
      ) : list.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {list.map((data, idx) => (
            <ArticleTile
              key={data.id || idx}
              articleData={data}
              isLoading={false}
            />
          ))}
        </div>
      ) : (
        <div className="flex w-full items-center justify-center gap-4 rounded-2xl border bg-white">
          <CircleOff strokeWidth={1.25} />
          <p>No more articles</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p>
          Showing {list.length} of {count} result(s)
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.pageIndex === 0}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: Math.max(prev.pageIndex - 1, 0),
              }))
            }
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            disabled={list.length < pagination.pageSize}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex + 1,
              }))
            }
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
