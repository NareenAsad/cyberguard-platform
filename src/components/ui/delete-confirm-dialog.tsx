'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface DeleteConfirmDialogProps {
    /** The trigger element — usually the existing Trash2 icon button. */
    children: React.ReactNode
    /** What's being deleted, e.g. "report", "incident", "playbook". */
    itemLabel: string
    /** Override the default "Delete this {itemLabel}?" title. */
    title?: string
    /** Override the default "This will permanently delete the {itemLabel}..." description. */
    description?: string
    onConfirm: () => void
}

export function DeleteConfirmDialog({ children, itemLabel, title, description, onConfirm }: DeleteConfirmDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title ?? `Delete this ${itemLabel}?`}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description ?? `This will permanently delete the ${itemLabel}. This action cannot be undone.`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500/40"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
