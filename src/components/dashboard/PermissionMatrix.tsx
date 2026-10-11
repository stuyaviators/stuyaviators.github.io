/* eslint-disable no-bitwise -- the permission number is a bit mask by design: each box is a power of two. */

import {
	permissionList,
	presets,
	roleDescriptions,
	roleLabels,
	roles,
} from "@/lib/permissions";
import { Check, X } from "lucide-react";

/**
The roles side by side: a tick or a cross for every box, and the permission
number each role adds up to.
*/
export default function PermissionMatrix({
	showSecret = false,
}: {
	// Show the boxes that only admins can see (the Trash).
	readonly showSecret?: boolean;
}) {
	const shown = permissionList.filter(
		(permission) => showSecret || permission.isSecret !== true
	);
	return (
		<div className="relative overflow-x-auto">
			<table className="w-full min-w-[34rem] table-fixed border-collapse text-sm">
				<caption className="sr-only">What each role can do</caption>
				{/* The first column takes what's left; every role gets the same width. */}
				<colgroup>
					<col />
					{roles.map((role) => (
						<col key={role} className="w-24 sm:w-28" />
					))}
				</colgroup>
				<thead>
					<tr className="border-b border-hairline text-left">
						<th scope="col" className="py-2 pr-3 font-semibold">
							Can do
						</th>
						{roles.map((role) => (
							<th
								key={role}
								scope="col"
								title={roleDescriptions[role]}
								className="px-2 py-2 text-center font-semibold"
							>
								{roleLabels[role]}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{shown.map((permission) => (
						<tr key={permission.key} className="border-b border-hairline">
							<th scope="row" className="py-2 pr-3 text-left font-normal">
								{permission.label}
								<span className="ml-1.5 text-xs text-muted">
									+{permission.value}
								</span>
							</th>
							{roles.map((role) => {
								const isTicked = (presets[role] & permission.value) !== 0;
								return (
									<td key={role} className="px-2 py-2 text-center">
										{isTicked ? (
											<Check
												aria-hidden
												className="mx-auto size-5 text-success"
											/>
										) : (
											<X aria-hidden className="mx-auto size-5 text-muted/60" />
										)}
										<span className="sr-only">{isTicked ? "Yes" : "No"}</span>
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
				<tfoot>
					<tr>
						<th scope="row" className="py-2 pr-3 text-left font-semibold">
							Permission number
						</th>
						{roles.map((role) => (
							<td key={role} className="px-2 py-2 text-center font-semibold">
								{presets[role]}
							</td>
						))}
					</tr>
				</tfoot>
			</table>
		</div>
	);
}
