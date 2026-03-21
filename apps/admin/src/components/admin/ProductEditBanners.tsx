"use client";

type Props = {
  productStatus: string;
  isDiscontinued: boolean;
  rejectionReason: string | null;
};

export function ProductEditBanners({ productStatus, isDiscontinued, rejectionReason }: Props) {
  return (
    <div className="space-y-2 mb-6">
      {productStatus === "rejected" && rejectionReason && (
        <div className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          <span className="font-medium">Previously rejected:</span> {rejectionReason}
        </div>
      )}
      {isDiscontinued && (
        <div className="text-sm text-stone-700 bg-stone-100 border border-stone-300 rounded-md px-3 py-2">
          This product is discontinued and hidden from customers.
        </div>
      )}
    </div>
  );
}
