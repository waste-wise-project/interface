'use client';

import toast, { Toast } from 'react-hot-toast';
import { JSX } from 'react';

interface ToastOptions {
	duration?: number;
	position?:
		| 'top-left'
		| 'top-center'
		| 'top-right'
		| 'bottom-left'
		| 'bottom-center'
		| 'bottom-right';
}

export function useToast() {
	const success = (message: string, options?: ToastOptions) => {
		return toast.success(message, {
			duration: options?.duration ?? 4000,
			position: options?.position ?? 'top-right',
		});
	};

	const error = (message: string, options?: ToastOptions) => {
		return toast.error(message, {
			duration: options?.duration ?? 5000,
			position: options?.position ?? 'top-right',
		});
	};

	const loading = (message: string) => {
		return toast.loading(message, {
			position: 'top-right',
		});
	};

	const promise = <T>(
		promise: Promise<T>,
		messages: {
			loading: string;
			success: string | ((data: T) => string);
			error: string | ((error: unknown) => string);
		},
		options?: ToastOptions
	) => {
		return toast.promise(promise, messages, {
			position: options?.position ?? 'top-right',
			success: {
				duration: options?.duration ?? 4000,
			},
			error: {
				duration: options?.duration ?? 5000,
			},
		});
	};

	const dismiss = (toastId?: string) => {
		if (toastId) {
			toast.dismiss(toastId);
		} else {
			toast.dismiss();
		}
	};

	// ---------- custom 方法带重载 ----------
	function custom(
		renderer: (t: Toast) => JSX.Element | string | null,
		options?: ToastOptions
	): string;
	function custom(
		jsx: JSX.Element | string | null,
		options?: ToastOptions
	): string;
	function custom(
		jsxOrRenderer:
			| JSX.Element
			| string
			| null
			| ((t: Toast) => JSX.Element | string | null),
		options?: ToastOptions
	): string {
		const renderer =
			typeof jsxOrRenderer === 'function'
				? (jsxOrRenderer as (t: Toast) => JSX.Element | string | null)
				: () => jsxOrRenderer;

		return toast.custom(renderer, {
			duration: options?.duration ?? 4000,
			position: options?.position ?? 'top-right',
		});
	}
	// ----------------------------------------

	return {
		success,
		error,
		loading,
		promise,
		dismiss,
		custom,
	};
}
