"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  return (
    <main className="mx-auto max-w-[720px] space-y-4 p-4">
      <h1 className="text-title font-semibold">Component check</h1>

      <div className="space-y-1">
        <label htmlFor="item" className="text-label font-medium">
          Item name
        </label>
        <Input id="item" placeholder="Tea" />
      </div>

      <Button className="h-[52px] w-full" onClick={() => toast("Sale saved")}>
        Show toast
      </Button>

      <Sheet>
        <SheetTrigger
          render={<Button variant="outline" className="h-[52px] w-full" />}
        >
          Open sheet
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Add item</SheetTitle>
            <SheetDescription>Name and price.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Toaster />
    </main>
  );
}
