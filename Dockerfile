FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY BookQuoteManager.Api/BookQuoteManager.Api.csproj BookQuoteManager.Api/
RUN dotnet restore BookQuoteManager.Api/BookQuoteManager.Api.csproj

COPY BookQuoteManager.Api/ BookQuoteManager.Api/
RUN dotnet publish BookQuoteManager.Api/BookQuoteManager.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

# Render sets PORT env var
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "BookQuoteManager.Api.dll"]
