const form = 
            document.getElementById('contactForm');
            const statusEL = 
            document.getElementById('formStatus');

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (statusEL) statusEL.textContent = 'Enviando...';
                try {
                    const resp = await fetch(form.action, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json'
                        }
                        , body: new FormData(form)
                    });
                    if (resp.ok) {
                        form.reset();
                        statusEl.textContent = 'Mensagem enviada com sucesso! Obrigado';
                    } else {
                        statusEl.textContent = 'Não foi possível enviar. Tente novamente.';
                    }
                } catch (err) {
                    statusEL.textContent = 'Erro de conexão. Verifique sua internet.';
                }
            });