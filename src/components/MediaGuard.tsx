"use client";

import { useEffect } from "react";

/*
 * Deters casual copying of photos and video: no context menu ("Save image
 * as…") or dragging over media anywhere on the site. Images and videos also
 * ignore the pointer in CSS (globals.css), so clicks reach their links and
 * buttons. A determined visitor can still screenshot or use devtools.
 */
function isOverMedia(target: EventTarget | undefined, x: number, y: number) {
	let element = target instanceof Element ? target : null;
	for (let depth = 0; element && depth < 6; depth++) {
		if (element.matches("img, video, [role='img']")) {
			return true;
		}

		for (const media of element.querySelectorAll("img, video, [role='img']")) {
			const box = media.getBoundingClientRect();
			if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
				return true;
			}
		}

		element = element.parentElement;
	}

	return false;
}

export default function MediaGuard() {
	useEffect(() => {
		const onContextMenu = (event: MouseEvent) => {
			if (isOverMedia(event.target ?? undefined, event.clientX, event.clientY)) {
				event.preventDefault();
			}
		};

		const onDragStart = (event: DragEvent) => {
			if (isOverMedia(event.target ?? undefined, event.clientX, event.clientY)) {
				event.preventDefault();
			}
		};

		document.addEventListener("contextmenu", onContextMenu);
		document.addEventListener("dragstart", onDragStart);
		return () => {
			document.removeEventListener("contextmenu", onContextMenu);
			document.removeEventListener("dragstart", onDragStart);
		};
	}, []);

	return null;
}
