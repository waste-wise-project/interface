import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// 专门用于垃圾分类图片上传
export async function uploadWasteImage(file: File): Promise<string> {
	const fileExt = file.name.split('.').pop();
	const fileName = `waste-${Date.now()}-${Math.random()
		.toString(36)
		.substring(2)}.${fileExt}`;
	const filePath = `wasteWise/${fileName}`;

	const { error } = await supabase.storage
		.from('waste-images')
		.upload(filePath, file, {
			cacheControl: '3600',
			upsert: false,
		});

	if (error) throw error;

	const {
		data: { publicUrl },
	} = supabase.storage.from('waste-images').getPublicUrl(filePath);

	return publicUrl;
}
