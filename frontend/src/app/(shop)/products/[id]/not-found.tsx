import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-3xl text-burgundy">Piece not found</h1>
      <p className="mt-4 text-stone">This product may no longer be available.</p>
      <Link href={ROUTES.shop} className="mt-8 inline-block">
        <Button>Back to shop</Button>
      </Link>
    </div>
  );
}
