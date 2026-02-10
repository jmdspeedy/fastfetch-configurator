
export const deployConfig = async (
    configStr: string,
    logoContent: string | undefined,
    altchaPayload: string
): Promise<{ success: boolean; command?: string; error?: string; status?: number }> => {
    try {
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                config: configStr,
                logo: logoContent,
                altchaPayload: altchaPayload
            })
        });

        if (response.ok) {
            const { id } = await response.json();
            const baseUrl = window.location.origin;
            const command = `curl -sSL "${baseUrl}/api/config?id=${id}&type=install" | bash`;
            return { success: true, command };
        } else {
            let errorMessage = 'Failed to generate install command.';
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch {
                // Response might not be JSON
            }
            return { success: false, error: errorMessage, status: response.status };
        }
    } catch (error) {
        console.error('Install command generation error:', error);
        return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
};
