import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function ProductNotFound() {
  return (
    <div className="container-premium py-24 text-center">
      <p className="text-eyebrow">404</p>
      <h1 className="mt-2 font-display text-section-title text-charcoal">Piece not found</h1>
      <p className="mt-4 text-body">This product may no longer be available.</p>
      <Link href={ROUTES.shop} className="mt-8 inline-block">
        <Button>Back to shop</Button>
      </Link>
    </div>
  );
}
