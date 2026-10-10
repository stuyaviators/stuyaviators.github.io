import { Clapperboard, Images } from "lucide-react";
import Image from "next/image";
import type { BeholdPost } from "@/lib/behold";
import { cn } from "@/lib/cn";

/*
 * Instagram posts from the Behold feed. Images come only from
 * sizes.*.mediaUrl on behold.pictures (already resized → unoptimized, so no
 * Vercel image-optimization quota is used).
 */
export default function InstagramGrid({
	posts,
	variant = "strip",
}: {
	readonly posts: BeholdPost[];
	readonly variant?: "strip" | "grid";
}) {
	return (
		<ul
			className={cn(
				"grid gap-2 sm:gap-3",
				variant === "strip"
					? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
					: "grid-cols-2 sm:grid-cols-3"
			)}
		>
			{posts.slice(0, 6).map((post, index) => {
				const featured = variant === "grid" && index === 0;
				const size = featured ? post.sizes.large : post.sizes.medium;
				const caption = post.prunedCaption || "Instagram post from @stuyaviators";
				return (
					<li
						key={post.id}
						className={cn(featured && "col-span-2 row-span-2")}
					>
						<a
							href={post.permalink}
							target="_blank"
							rel="noopener noreferrer"
							className="group relative block aspect-square overflow-hidden rounded-md"
							style={{ backgroundColor: post.placeholder }}
						>
							<Image
								src={size.mediaUrl}
								alt={caption}
								fill
								unoptimized
								sizes={featured ? "(min-width: 640px) 66vw, 100vw" : "(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"}
								className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
							/>
							{post.mediaType === "IMAGE" ? null : (
								<span className="absolute top-2 right-2 rounded bg-navy/70 p-1 text-white">
									{post.mediaType === "VIDEO" ? (
										<Clapperboard aria-hidden className="size-4" />
									) : (
										<Images aria-hidden className="size-4" />
									)}
									<span className="sr-only">
										{post.mediaType === "VIDEO" ? "Video" : "Carousel"}
									</span>
								</span>
							)}
							<span
								aria-hidden
								className="absolute inset-x-0 bottom-0 line-clamp-3 bg-linear-to-t from-navy/90 to-transparent p-2 pt-8 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
							>
								{caption}
							</span>
						</a>
					</li>
				);
			})}
		</ul>
	);
}
