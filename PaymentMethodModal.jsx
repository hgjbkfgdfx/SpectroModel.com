import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreditCard, Shield } from "lucide-react";

export default function PaymentMethodModal({ isOpen, onClose }) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-slate-900 border border-slate-700 text-slate-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-400" />
            Add Payment Method
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-green-950/30 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-bold text-xs uppercase">Secure Payment</span>
                </div>
                <p className="text-xs text-slate-400">
                  Payment methods are encrypted and stored securely. We accept major credit cards and bank transfers.
                </p>
              </div>
              
              <p className="text-xs text-slate-500 font-mono text-center">
                Payment integration coming soon. Contact support for manual billing.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700 border-slate-600">
            Close
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}