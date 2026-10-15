public static class MusicApi
{
    public static void MapMusicApi(this WebApplication app)
    {
        app.MapGet("/api/radio/now-playing", async (MusicAssistantClient music, CancellationToken cancellationToken) =>
        {
            try
            {
                var media = await music.GetNowPlayingAsync(cancellationToken);

                return media.HasValue
                    ? Results.Json(media.Value)
                    : Results.NotFound(new { message = "No current media found." });
            }
            catch (InvalidOperationException ex)
            {
                return Results.Problem(
                    ex.Message,
                    statusCode: StatusCodes.Status503ServiceUnavailable);
            }
            catch (HttpRequestException)
            {
                return Results.Problem(
                    "Music Assistant request failed.",
                    statusCode: StatusCodes.Status502BadGateway);
            }
        });


        app.MapPost("/api/radio/next", async (MusicAssistantClient music, CancellationToken cancellationToken) =>
        {
            try
            {
                await music.SkipNextAsync(cancellationToken);
                return Results.Ok();
            }
            catch (InvalidOperationException ex)
            {
                return Results.Problem(
                    ex.Message,
                    statusCode: StatusCodes.Status503ServiceUnavailable);
            }
            // catch (HttpRequestException)
            // {
            //     return Results.Problem(
            //         "Music Assistant request failed.",
            //         statusCode: StatusCodes.Status502BadGateway);
            // }

            catch (HttpRequestException ex)
            {
                app.Logger.LogError(ex, "Music Assistant command failed");
                return Results.Problem(
                            "Music Assistant request failed.",
                            statusCode: StatusCodes.Status502BadGateway);
            }
        });

        app.MapPost("/api/radio/previous", async (MusicAssistantClient music, CancellationToken cancellationToken) =>
        {
            try
            {
                await music.SkipPreviousAsync(cancellationToken);
                return Results.Ok();
            }
            catch (InvalidOperationException ex)
            {
                return Results.Problem(
                    ex.Message,
                    statusCode: StatusCodes.Status503ServiceUnavailable);
            }
            catch (HttpRequestException)
            {
                return Results.Problem(
                    "Music Assistant request failed.",
                    statusCode: StatusCodes.Status502BadGateway);
            }
        });

        app.MapPost("/api/radio/play", async (
    MusicAssistantClient music,
    CancellationToken cancellationToken) =>
{
    try
    {
        await music.PlayAsync(cancellationToken);
        return Results.Ok();
    }
    catch (InvalidOperationException ex)
    {
        return Results.Problem(
            ex.Message,
            statusCode: StatusCodes.Status503ServiceUnavailable);
    }
    catch (HttpRequestException ex)
    {
        app.Logger.LogError(ex, "Music Assistant Play command failed");
        return Results.Problem(
            "Music Assistant request failed.",
            statusCode: StatusCodes.Status502BadGateway);
    }
});

        app.MapPost("/api/radio/stop", async (MusicAssistantClient music, CancellationToken cancellationToken) =>
        {
            try
            {
                await music.StopAsync(cancellationToken);
                return Results.Ok();
            }
            catch (InvalidOperationException ex)
            {
                return Results.Problem(
                    ex.Message,
                    statusCode: StatusCodes.Status503ServiceUnavailable);
            }
            catch (HttpRequestException ex)
            {
                app.Logger.LogError(ex, "Music Assistant Stop command failed");
                return Results.Problem(
                    "Music Assistant request failed.",
                    statusCode: StatusCodes.Status502BadGateway);
            }
        });
    }
}