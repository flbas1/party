using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

public sealed class MusicAssistantClient(
    IHttpClientFactory clients,
    IConfiguration configuration)
{
    public async Task<JsonElement?> GetNowPlayingAsync(
        CancellationToken cancellationToken)
    {
        var token = configuration["MusicAssistant:Token"];
        if (string.IsNullOrWhiteSpace(token))
            throw new InvalidOperationException(
                "Music Assistant token is not configured.");

        var playerId = configuration["MusicAssistant:PlayerId"];
        if (string.IsNullOrWhiteSpace(playerId))
            throw new InvalidOperationException(
                "Music Assistant player ID is not configured.");

        var client = clients.CreateClient("MusicAssistant");

        using var request = new HttpRequestMessage(HttpMethod.Post, "/api");
        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        request.Content = new StringContent(
            JsonSerializer.Serialize(new
            {
                message_id = "party",
                command = "players/all"
            }),
            Encoding.UTF8,
            "application/json");

        using var response = await client.SendAsync(
            request, cancellationToken);

        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException(
                "Music Assistant request failed.",
                null,
                response.StatusCode);

        await using var responseStream =
            await response.Content.ReadAsStreamAsync(cancellationToken);

        using var document = await JsonDocument.ParseAsync(
            responseStream, cancellationToken: cancellationToken);

        foreach (var player in document.RootElement.EnumerateArray())
        {
            if (player.TryGetProperty("player_id", out var id) &&
                id.GetString() == playerId)
            {
                if (player.TryGetProperty("current_media", out var media))
                    return media.Clone();

                return null;
            }
        }

        return null;
    }

    private async Task SendCommandAsync(
        string command,
        CancellationToken cancellationToken)
    {
        var token = configuration["MusicAssistant:Token"];
        if (string.IsNullOrWhiteSpace(token))
            throw new InvalidOperationException(
                "Music Assistant token is not configured.");

        var client = clients.CreateClient("MusicAssistant");

        using var request = new HttpRequestMessage(HttpMethod.Post, "/api");
        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        request.Content = new StringContent(
           JsonSerializer.Serialize(new
           {
               message_id = "party",
               command,
               args = new
               {
                   player_id = configuration["MusicAssistant:PlayerId"]
               }
           }),
           Encoding.UTF8,
           "application/json");

        using var response = await client.SendAsync(
            request, cancellationToken);

        // if (!response.IsSuccessStatusCode)
        //     throw new HttpRequestException(
        //         $"Music Assistant command '{command}' failed.",
        //         null,
        //         response.StatusCode);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(
                cancellationToken);

            throw new HttpRequestException(
                $"Music Assistant command '{command}' failed: " +
                $"{(int)response.StatusCode} {response.StatusCode}. " +
                $"Response: {body}",
                null,
                response.StatusCode);
        }
    }

    public Task SkipNextAsync(CancellationToken cancellationToken) => SendCommandAsync("players/cmd/next", cancellationToken);

    public Task SkipPreviousAsync(CancellationToken cancellationToken) => SendCommandAsync("players/cmd/previous", cancellationToken);

    public Task PlayAsync(CancellationToken cancellationToken) => SendCommandAsync("players/cmd/play", cancellationToken);

    public Task StopAsync(CancellationToken cancellationToken) => SendCommandAsync("players/cmd/stop", cancellationToken);

}